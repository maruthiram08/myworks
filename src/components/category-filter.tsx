'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { PROPERTY_CATEGORIES } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CategoryFilterProps {
  categories: Array<{
    category: string
    _count: { category: number }
  }>
}

export function CategoryFilter({ categories }: CategoryFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get('category') || 'all'

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (category === 'all') {
      params.delete('category')
    } else {
      params.set('category', category)
    }
    router.push(`/?${params.toString()}`)
  }

  const categoryMap = new Map(categories.map((c) => [c.category, c._count.category]))

  return (
    <div className="flex gap-2 overflow-x-auto pb-4">
      <Button
        variant={currentCategory === 'all' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleCategoryChange('all')}
        className="whitespace-nowrap"
      >
        All Properties
      </Button>
      {PROPERTY_CATEGORIES.map((category) => {
        const count = categoryMap.get(category.value) || 0
        if (count === 0) return null

        return (
          <Button
            key={category.value}
            variant={currentCategory === category.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleCategoryChange(category.value)}
            className="whitespace-nowrap"
          >
            <span className="mr-2">{category.icon}</span>
            {category.label} ({count})
          </Button>
        )
      })}
    </div>
  )
}
