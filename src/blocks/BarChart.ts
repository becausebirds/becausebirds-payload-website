import type { Block } from 'payload'

export const BarChartBlock: Block = {
  slug: 'bar-chart',
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
      name: 'caption',
      type: 'textarea',
      label: 'Caption (shown below chart)',
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
          label: 'Label (e.g. month name)',
        },
        {
          name: 'value1',
          type: 'number',
          required: true,
          label: 'First Series Value',
        },
        {
          name: 'value2',
          type: 'number',
          label: 'Second Series Value',
        },
      ],
    },
    {
      name: 'series1Label',
      type: 'text',
      required: true,
      label: 'First Series Label (legend)',
      defaultValue: 'Desktop',
    },
    {
      name: 'series1Color',
      type: 'select',
      label: 'First Series Color',
      defaultValue: 'chart-1',
      options: [
        { label: 'Chart Red',    value: 'chart-1' },
        { label: 'Chart Teal',   value: 'chart-2' },
        { label: 'Chart Navy',   value: 'chart-3' },
        { label: 'Chart Gold',   value: 'chart-4' },
        { label: 'Chart Orange', value: 'chart-5' },
      ],
    },
    {
      name: 'series2Label',
      type: 'text',
      label: 'Second Series Label (legend)',
      defaultValue: 'Mobile',
    },
    {
      name: 'series2Color',
      type: 'select',
      label: 'Second Series Color',
      defaultValue: 'chart-2',
      options: [
        { label: 'Chart Red',    value: 'chart-1' },
        { label: 'Chart Teal',   value: 'chart-2' },
        { label: 'Chart Navy',   value: 'chart-3' },
        { label: 'Chart Gold',   value: 'chart-4' },
        { label: 'Chart Orange', value: 'chart-5' },
      ],
      admin: {
        condition: (_, siblingData) =>
          siblingData?.chartData?.some((d: any) => d.value2 != null),
      },
    },
  ],
}
