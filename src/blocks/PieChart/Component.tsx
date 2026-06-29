'use client'

import { Pie, PieChart } from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart'

export default function PieChartBlock({ block }: { block: any }) {
  const { title, description, chartData } = block

  const data = (chartData ?? []).map((entry: any) => ({
    label: entry.label,
    value: entry.value,
    color: entry.color ?? 'chart-1',
    fill: `var(--${entry.color ?? 'chart-1'})`,
  }))

  // Build chartConfig dynamically from data entries
  const chartConfig: ChartConfig = {
    value: { label: 'Value' },
    ...Object.fromEntries(
      data.map((entry: any) => [
        entry.label,
        { label: entry.label, color: `var(--${entry.color ?? 'chart-1'})` },
      ]),
    ),
  }

  return (
    <Card className="flex flex-col bg-card text-foreground">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="label" />
            <ChartLegend
              content={<ChartLegendContent payload={[]} nameKey="label" />}
              className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
