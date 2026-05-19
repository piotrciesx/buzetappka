import CategoryTrendWidgetBase, { type CategoryTrendWidgetProps } from './CategoryTrendWidgetBase'

export default function ExpenseCategoryTrendWidget(props: CategoryTrendWidgetProps) {
  return <CategoryTrendWidgetBase {...props} variant="expense" />
}
