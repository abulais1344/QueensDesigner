import { Compass } from 'lucide-react'
import { Link } from 'react-router-dom'
import { EmptyState } from '../components/ui/EmptyState'
import { buttonClass } from '../lib/ui'

export default function NotFound() {
  return (
    <EmptyState
      icon={Compass}
      title="We couldn’t find that page"
      message="The link may be broken or the page may have moved."
      action={
        <Link to="/" className={buttonClass('primary')}>
          Back to home
        </Link>
      }
    />
  )
}
