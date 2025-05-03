import Link from 'next/link'
import {ReactNode} from 'react'

const Rootlayout = ({children}:{children: ReactNode}) => { // we are using ReactNode type for children prop to allow any type of children including string, number, element, etc.
  // children beacause we are using this layout for multiple pages and we want to render the children of the page inside this layout
  return (
    <div className='root-layout'>
      <nav>
        <Link href="/" className='flex items-center gap-2' >
          <img src="/logo.svg" alt="Logo" width={38} height={32} />
          <h2 className='text-primary-100'>AceAI</h2>
        </Link>
      </nav>
      {children}
    </div>
  )
}

export default Rootlayout