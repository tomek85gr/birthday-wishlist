import type {Metadata} from "next";import "./globals.css";
export const metadata:Metadata={title:"Birthday Wishlist — Μια γιορτή γεμάτη αγάπη",description:"Μια γλυκιά πρόσκληση γενεθλίων και λίστα δώρων."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="el"><body>{children}</body></html>}
