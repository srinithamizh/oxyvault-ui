import { formatCurrency } from "./formatCurrency";

describe("formatCurrency", () => {
  it("uses rupees with Indian digit grouping", () => {
    expect(formatCurrency(248820)).toBe("₹2,48,820");
    expect(formatCurrency(1842000)).toBe("₹18,42,000");
  });

  it("keeps up to two decimals", () => {
    expect(formatCurrency(1250.5)).toBe("₹1,250.5");
    expect(formatCurrency(0)).toBe("₹0");
  });
});
