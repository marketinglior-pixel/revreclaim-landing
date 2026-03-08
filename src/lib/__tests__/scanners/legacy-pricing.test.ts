import { describe, it, expect, beforeEach } from "vitest";
import { scanLegacyPricing } from "../../scanners-v2/legacy-pricing";
import {
  mockSubscription,
  mockPrice,
  mockProduct,
  resetCounter,
} from "./helpers";
import type { NormalizedSubscriptionItem } from "../../platforms/types";

describe("scanLegacyPricing", () => {
  beforeEach(() => {
    resetCounter();
  });

  it("returns empty array when no subscriptions", () => {
    expect(scanLegacyPricing([], [], [])).toEqual([]);
  });

  it("returns empty array when only one price exists for product", () => {
    const productId = "prod_1";
    const priceId = "price_old";

    const sub = mockSubscription({
      items: [
        {
          priceId,
          productId,
          unitAmountCents: 4900,
          quantity: 1,
          interval: "month",
        } as NormalizedSubscriptionItem,
      ],
    });

    const prices = [mockPrice({ id: priceId, productId, unitAmountCents: 4900 })];
    const products = [mockProduct({ id: productId, active: true })];

    expect(scanLegacyPricing([sub], prices, products)).toEqual([]);
  });

  it("detects customer on old pricing when newer price is more expensive", () => {
    const productId = "prod_1";
    const oldPriceId = "price_old";
    const newPriceId = "price_new";
    const now = Math.floor(Date.now() / 1000);

    const sub = mockSubscription({
      items: [
        {
          priceId: oldPriceId,
          productId,
          unitAmountCents: 4900,
          quantity: 1,
          interval: "month",
        } as NormalizedSubscriptionItem,
      ],
    });

    const prices = [
      mockPrice({
        id: oldPriceId,
        productId,
        unitAmountCents: 4900,
        createdAt: now - 86400 * 365, // old
      }),
      mockPrice({
        id: newPriceId,
        productId,
        unitAmountCents: 6900,
        createdAt: now - 86400 * 30, // newer
      }),
    ];

    const products = [mockProduct({ id: productId, active: true })];

    const leaks = scanLegacyPricing([sub], prices, products);
    expect(leaks).toHaveLength(1);
    expect(leaks[0].type).toBe("legacy_pricing");
    expect(leaks[0].monthlyImpact).toBe(2000); // 6900 - 4900
    expect(leaks[0].annualImpact).toBe(24000);
  });

  it("ignores when customer is already on newest price", () => {
    const productId = "prod_1";
    const newPriceId = "price_new";
    const now = Math.floor(Date.now() / 1000);

    const sub = mockSubscription({
      items: [
        {
          priceId: newPriceId,
          productId,
          unitAmountCents: 6900,
          quantity: 1,
          interval: "month",
        } as NormalizedSubscriptionItem,
      ],
    });

    const prices = [
      mockPrice({
        id: "price_old",
        productId,
        unitAmountCents: 4900,
        createdAt: now - 86400 * 365,
      }),
      mockPrice({
        id: newPriceId,
        productId,
        unitAmountCents: 6900,
        createdAt: now - 86400 * 30,
      }),
    ];

    const products = [mockProduct({ id: productId, active: true })];

    expect(scanLegacyPricing([sub], prices, products)).toEqual([]);
  });

  it("ignores when new price is cheaper (price reduction)", () => {
    const productId = "prod_1";
    const now = Math.floor(Date.now() / 1000);

    const sub = mockSubscription({
      items: [
        {
          priceId: "price_old",
          productId,
          unitAmountCents: 6900,
          quantity: 1,
          interval: "month",
        } as NormalizedSubscriptionItem,
      ],
    });

    const prices = [
      mockPrice({
        id: "price_old",
        productId,
        unitAmountCents: 6900,
        createdAt: now - 86400 * 365,
      }),
      mockPrice({
        id: "price_new",
        productId,
        unitAmountCents: 4900,
        createdAt: now - 86400 * 30,
      }),
    ];

    const products = [mockProduct({ id: productId, active: true })];

    expect(scanLegacyPricing([sub], prices, products)).toEqual([]);
  });

  it("detects subscription on archived product", () => {
    const productId = "prod_archived";

    const sub = mockSubscription({
      items: [
        {
          priceId: "price_1",
          productId,
          unitAmountCents: 4900,
          quantity: 1,
          interval: "month",
        } as NormalizedSubscriptionItem,
      ],
    });

    const prices: ReturnType<typeof mockPrice>[] = [];
    const products = [mockProduct({ id: productId, active: false })];

    const leaks = scanLegacyPricing([sub], prices, products);
    expect(leaks).toHaveLength(1);
    expect(leaks[0].type).toBe("legacy_pricing");
    expect(leaks[0].metadata.archived).toBe(true);
    expect(leaks[0].monthlyImpact).toBe(0); // No monetary impact for archived
  });

  it("assigns severity based on percent difference", () => {
    const productId = "prod_1";
    const now = Math.floor(Date.now() / 1000);

    // > 30% difference = high severity
    const sub = mockSubscription({
      items: [
        {
          priceId: "price_old",
          productId,
          unitAmountCents: 3000,
          quantity: 1,
          interval: "month",
        } as NormalizedSubscriptionItem,
      ],
    });

    const prices = [
      mockPrice({
        id: "price_old",
        productId,
        unitAmountCents: 3000,
        createdAt: now - 86400 * 365,
      }),
      mockPrice({
        id: "price_new",
        productId,
        unitAmountCents: 5000,
        createdAt: now - 86400 * 30,
      }),
    ];

    const products = [mockProduct({ id: productId, active: true })];

    const leaks = scanLegacyPricing([sub], prices, products);
    expect(leaks[0].severity).toBe("high"); // 67% diff
  });

  it("ignores canceled subscriptions", () => {
    const sub = mockSubscription({
      status: "canceled",
      items: [
        {
          priceId: "price_old",
          productId: "prod_1",
          unitAmountCents: 4900,
          quantity: 1,
          interval: "month",
        } as NormalizedSubscriptionItem,
      ],
    });

    expect(scanLegacyPricing([sub], [], [])).toEqual([]);
  });

  it("only considers active prices", () => {
    const productId = "prod_1";
    const now = Math.floor(Date.now() / 1000);

    const sub = mockSubscription({
      items: [
        {
          priceId: "price_old",
          productId,
          unitAmountCents: 4900,
          quantity: 1,
          interval: "month",
        } as NormalizedSubscriptionItem,
      ],
    });

    const prices = [
      mockPrice({
        id: "price_old",
        productId,
        unitAmountCents: 4900,
        createdAt: now - 86400 * 365,
      }),
      mockPrice({
        id: "price_new_inactive",
        productId,
        unitAmountCents: 9900,
        active: false, // Inactive price should be ignored
        createdAt: now - 86400 * 30,
      }),
    ];

    const products = [mockProduct({ id: productId, active: true })];

    expect(scanLegacyPricing([sub], prices, products)).toEqual([]);
  });
});
