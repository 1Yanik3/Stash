// import type { LayoutServerLoad } from './$types'

// import { redirect } from '@sveltejs/kit'
// import jwt from 'jsonwebtoken'

// const isJwtValid = (token: string) => {
//   try {
//     return jwt.verify(token, "superSecretKey") == "verified"
//   } catch {
//     return false
//   }
// }

// export const load: LayoutServerLoad = ({ cookies, url }) => {
//   if (url.pathname == "/auth" && isJwtValid(cookies.get("session") || ""))
//     throw redirect(307, '/')
//   else if (!url.pathname.startsWith("/auth") && !isJwtValid(cookies.get("session") || ""))
//     throw redirect(307, '/auth');
// }