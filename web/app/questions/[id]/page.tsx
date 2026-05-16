import { notFound } from 'next/navigation'
import { questionMap } from '@/lib/data'
import { QuestionDetail } from '@/components/QuestionDetail'

export default async function QuestionPage(props: PageProps<'/questions/[id]'>) {
  const { id } = await props.params
  const question = questionMap.get(id)

  if (!question) notFound()

  return <QuestionDetail question={question} />
}

export async function generateStaticParams() {
  const { allQuestions } = await import('@/lib/data')
  return allQuestions.map(q => ({ id: q.id }))
}
