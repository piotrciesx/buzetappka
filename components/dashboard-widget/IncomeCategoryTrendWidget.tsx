import CategoryTrendWidgetBase, { type CategoryTrendWidgetProps } from './CategoryTrendWidgetBase'

export default function IncomeCategoryTrendWidget(props: CategoryTrendWidgetProps) {
  return <CategoryTrendWidgetBase {...props} variant="income" />
}
