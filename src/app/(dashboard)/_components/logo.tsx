import Image from "next/image";
import icon from "@/app/favicon.ico"

export const Logo = () => {
  return (
    <Image height={60} width={60} alt="logo" src="/logo.svg" />
  )
}

