"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Category } from "@/types/category"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface FeaturedCategoriesProps {
    categories: Category[]
}

/**
 * FeaturedCategories — Editorial Minimal (dark-mode ready)
 */
export function FeaturedCategories({ categories }: FeaturedCategoriesProps) {
    return (
        <section className="py-16 bg-surface">
            <div className="container-app">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <p className="section-label mb-2">Danh mục</p>
                    <h2 className="section-title">Mua sắm theo danh mục</h2>
                    <p className="text-ink-soft text-body max-w-2xl mx-auto mt-2">
                        Khám phá nhiều sản phẩm công nghệ cao cấp của chúng tôi
                    </p>
                </motion.div>

                <div className="flex overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide gap-6">
                    {categories.map((category, index) => (
                        <motion.div
                            key={category.id}
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="flex-none snap-center"
                        >
                            <Link
                                href={`/${category.slug}`}
                                className={cn(
                                    "flex-shrink-0 snap-start rounded-xl overflow-hidden group",
                                    "flex flex-col items-center transition-all",
                                )}
                            >
                                <Card className="w-64 group cursor-pointer hover:shadow-lg transition-shadow duration-300 border-line">
                                    <CardContent className="p-0 relative overflow-hidden">
                                        <div className="relative h-48 bg-surface">
                                            <Image
                                                src={category.image || "/placeholder.svg"}
                                                alt={category.name}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>

                                        <div className="p-6">
                                            <h3 className="text-h3 font-semibold mb-2 group-hover:text-brand transition-colors text-ink">
                                                {category.name}
                                            </h3>
                                            <Badge variant="secondary" className="mb-2 bg-surface text-ink-soft border-line">
                                                {category.productCount} sản phẩm
                                            </Badge>
                                            <p className="text-ink-soft text-small line-clamp-2">
                                                {category.description}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
