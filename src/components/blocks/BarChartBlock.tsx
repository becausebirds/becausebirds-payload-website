'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'

import type { BarChartBlock as BarChartBlockType } from '@/payload-types'

// ---------- chartConfig helper ----------
function buildChartConfig(series1Label: string, series2Label?: string) {
  const config: Record<string, { label: string; color: string }> = {
    value1: {
      label: series1Label,
      color: 'var(--chart-1)',
    },
  }
  if (series2Label) {
    config.value2 = {
      label: series2Label,
      color: 'var(--chart-2)',
    }
  }
  return config
}

// ---------- component ----------
export default function BarChartBlock({ block }: { block: BarChartBlockType }) {
  const { title, description, caption, chartData, series1Label, series2Label } = block

  // Transform payload data → Recharts-friendly array
  const data = (chartData ?? []).map((entry) => ({
    label: entry.label,
    value1: entry.value1,
    ...(entry.value2 !== null && entry.value2 !== undefined
      ? { value2: entry.value2 }
      : {}),
  }))

  const chartConfig = buildChartConfig(series1Label, series2Label ?? undefined)
  const hasTwoSeries = data.some((d) => d.value2 !== undefined)

  return (
    <Card className="bg-secondary-background text-foreground">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="value1"
              fill="var(--color-value1)"
              radius={4}
            />
            {hasTwoSeries && (
              <Bar
                dataKey="value2"
                fill="var(--color-value2)"
                radius={4}
              />
            )}
          </BarChart>
        </ChartContainer>
      </CardContent>
      {caption && (
        <CardFooter>
          <div className="flex w-full items-start gap-2 text-sm">
            <div className="grid gap-2">
              <div className="flex items-center gap-2 leading-none">
                {caption}
              </div>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
