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

export function FeaturedCategories({ categories }: FeaturedCategoriesProps) {
    return (
        <section className="py-16 bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Mua sắm theo danh mục
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
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
                                key={category.id}
                                href={`/${category.slug}`}
                                className={cn(
                                    "flex-shrink-0 snap-start rounded-lg overflow-hidden group",
                                    "flex flex-col items-center transition-all",
                                )}
                            >
                                <Card className="w-64 h-90 group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                                    <CardContent className="p-0 relative overflow-hidden rounded-lg">
                                        <div className="relative h-48 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900">
                                            <Image
                                                src={category.image || "/placeholder.svg"}
                                                alt={category.name}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-300"
                                            />
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
                                        </div>

                                        <div className="p-6">
                                            <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                {category.name}
                                            </h3>
                                            <Badge variant="secondary" className="mb-2">
                                                {category.productCount} sản phẩm
                                            </Badge>
                                            <p className="text-gray-600 dark:text-gray-300 text-sm">
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
