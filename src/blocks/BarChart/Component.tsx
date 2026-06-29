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

function buildChartConfig(
  series1Label: string,
  series1Color: string,
  series2Label?: string,
  series2Color?: string,
) {
  const config: Record<string, { label: string; color: string }> = {
    value1: {
      label: series1Label,
      color: `var(--${series1Color})`,
    },
  }
  if (series2Label && series2Color) {
    config.value2 = {
      label: series2Label,
      color: `var(--${series2Color})`,
    }
  }
  return config
}

export default function BarChartBlock({ block }: { block: any }) {
  const {
    title,
    description,
    caption,
    chartData,
    series1Label,
    series1Color = 'chart-1',
    series2Label,
    series2Color = 'chart-2',
  } = block

  const data = (chartData ?? []).map((entry: any) => ({
    label: entry.label,
    value1: entry.value1,
    ...(entry.value2 != null ? { value2: entry.value2 } : {}),
  }))

  const hasTwoSeries = data.some((d: any) => d.value2 !== undefined)

  const chartConfig = buildChartConfig(
    series1Label ?? 'Series 1',
    series1Color,
    hasTwoSeries ? series2Label ?? 'Series 2' : undefined,
    hasTwoSeries ? series2Color : undefined,
  )

  return (
    <Card className="bg-card text-foreground">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="label" tickLine={false} tickMargin={10} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="value1" fill="var(--color-value1)" radius={4} />
            {hasTwoSeries && (
              <Bar dataKey="value2" fill="var(--color-value2)" radius={4} />
            )}
          </BarChart>
        </ChartContainer>
      </CardContent>
      {caption && (
        <CardFooter>
          <div className="flex w-full items-start gap-2 text-sm">
            <div className="grid gap-2">
              <div className="flex items-center gap-2 leading-none">{caption}</div>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
