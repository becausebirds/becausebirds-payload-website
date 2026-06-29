import type { Block } from 'payload'

export const PieChartBlock: Block = {
  slug: 'pie-chart',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Chart Title',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Chart Description',
    },
    {
      name: 'chartData',
      type: 'array',
      required: true,
      label: 'Chart Data Entries',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          label: 'Label (e.g. Chrome, Safari)',
        },
        {
          name: 'value',
          type: 'number',
          required: true,
          label: 'Value',
        },
        {
          name: 'color',
          type: 'select',
          label: 'Color',
          defaultValue: 'chart-1',
          options: [
            { label: 'Chart Red',    value: 'chart-1' },
            { label: 'Chart Teal',   value: 'chart-2' },
            { label: 'Chart Navy',   value: 'chart-3' },
            { label: 'Chart Gold',   value: 'chart-4' },
            { label: 'Chart Orange', value: 'chart-5' },
          ],
        },
      ],
    },
  ],
}
