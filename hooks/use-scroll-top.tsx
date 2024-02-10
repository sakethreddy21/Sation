import {useState, useEffect} from 'react'


export const useScrollTop=(threeshold=10)=>{
  const [scrolled, setScrolled] = useState(false);
useEffect(()=>{
  const handleScroll=()=>{
  if(window.scrollY>threeshold){
    setScrolled(true);
  }
  else{
    setScrolled(false)
  }
}
window.addEventListener("scroll", handleScroll)
return ()=> window.removeEventListener("scroll", handleScroll)
},[threeshold])
return scrolled
}

