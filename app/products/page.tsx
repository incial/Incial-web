"use client";

import MenuFrame from "@/components/layout/MenuFrame";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductsFlow from "@/components/features/products/ProductsFlow";
import ProductsOutro from "@/components/features/products/ProductsOutro";
import type { ProductsData, Product } from "@/lib/dataLoader";
import { fetchCachedJson } from "@/lib/publicCache";
import { useSectionsConfig } from "@/lib/useSectionsConfig";

// ── Page ───────────────────────────────────────────────────────────────────
export default function ProductsPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const sectionsConfig = useSectionsConfig();
  const isDisabled = sectionsConfig["products"] === false;

  useEffect(() => {
    let cancelled = false;
    fetchCachedJson<ProductsData>("/api/admin/products").then((data) => {
      if (!cancelled && data) {
        setProducts(data.products.filter((p) => p.available));
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (isDisabled) {
    return (
      <div className="relative min-h-screen bg-white">
        <Header
          menuOpen={menuOpen}
          onToggleMenu={() => setMenuOpen(!menuOpen)}
        />
        <div className="flex min-h-[70vh] items-center justify-center bg-black text-white px-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Section Disabled</h1>
            <p className="text-gray-400">This page is currently unavailable.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-white">
      <Header menuOpen={menuOpen} onToggleMenu={() => setMenuOpen(!menuOpen)} blend />

      <MenuFrame open={menuOpen} />

      <motion.div
        animate={{
          y: menuOpen ? 100 : 0,
        }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative origin-top overflow-x-clip bg-[#f7f9f8] text-[#151716] min-h-screen"
        style={{ zIndex: 30 }}
      >
        <main className="pb-20">
          <ProductsFlow
            products={sectionsConfig["products-list"] === false ? [] : products}
          />

          {/* ── Closing statement ────────────────────────────────────────── */}
          {sectionsConfig["products-coming-soon"] !== false && <ProductsOutro />}
        </main>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <div className="rounded-t-[2rem] bg-black pb-4 pt-8 text-white">
          <div
            className="mx-auto w-full px-6 md:px-[149px]"
            style={{ maxWidth: "1439px" }}
          >
            <Footer />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
