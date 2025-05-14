import { isAuthenticated } from '@/lib/actions/auth.action';
import { redirect } from 'next/navigation';
import {ReactNode} from 'react'

const Authlayout = async({children}:{children: ReactNode}) => { // we are using ReactNode type for children prop to allow any type of children including string, number, element, etc.
  // children beacause we are using this layout for multiple pages and we want to render the children of the page inside this layout
    const isUserAuthenticated = await isAuthenticated();
  if (isUserAuthenticated) redirect("/");

  return (
    <div className='auth-layout'>{children}</div>
  )
}

export default Authlayout