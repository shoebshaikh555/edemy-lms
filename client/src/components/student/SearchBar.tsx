import { useNavigate } from "react-router-dom"
import { assets } from "../../assets/assets"
import { useState } from "react"
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SearchBar = ({ data }: { data: any }) => {
  const navigate = useNavigate()
  const [input, setInput] = useState(data ? data : '')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSearchHandler = (e: any) => {
    e.preventDefault()
    navigate('/course-list/' + input)
  }


  return (
    <form onSubmit={onSearchHandler} className="max-w-xl w-full md:h-14 h-12 flex items-center bg-white border border-gray-500/20 rounded">
      <img src={assets.search_icon} alt="search_icon" className="md:w-auto w-10 px-3" />
      <input type="text" className="w-full h-full outline-none text-gray-500/80" placeholder="Search for courses" onChange={e => setInput(e.target.value)} />
      <button type="submit" className="bg-blue-600 rounded text-white md:px-10 px-7 md:py-3 py-2 mx-1">Search</button>
    </form>
  )
}

export default SearchBar