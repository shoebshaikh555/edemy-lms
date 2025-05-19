import { createContext, useEffect, useState } from "react";
import { dummyCourses } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import humanizeDuration from "humanize-duration";
import { useAuth, useUser } from '@clerk/clerk-react';
import axios from 'axios';
import { toast } from "react-toastify";

export const AppContext = createContext({})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const AppContextProvider = (props: any) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL
  const currency = import.meta.env.VITE_CURRENCY
  const navigate = useNavigate()
  const { getToken } = useAuth()
  const { user } = useUser()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [isEducator, setIsEducator] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [userData, setUserData] = useState(null)

  const fetchAllCourses = async () => {
    // setAllCourses(dummyCourses)
    try {
      const { data } = await axios.get(backendUrl + '/api/course/all')
      if (data.success) {
        setAllCourses(data.courses)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  // Fetch User Data
  const fetchUserData = async () => {
    if (user?.publicMetadata.role === "role") {
      setIsEducator(true)
    }
    try {
      const token = await getToken()
      const { data } = await axios.get(backendUrl + '/api/user/data', { headers: { Authorization: `Bearer ${token}` } })
      if (data.success) {
        setUserData(data.user)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  // Function to calculate average rating of course
  const calculateRating = (course) => {
    if (course.courseRatings.length === 0) {
      return 0
    }
    let totalRating = 0;
    course.courseRatings.forEach(rating => {
      totalRating += rating.rating
    })
    return Math.floor(totalRating / course.courseRatings.length);
  }

  // Function to calculate course chapter time
  const calculateChapterTime = (chapter) => {
    let time = 0
    chapter.chapterContent.map((lecture) => time += lecture.lectureDuration)
    return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] })
  }

  // Function to calculate course duration
  const calculateCourseDuration = (course) => {
    let time = 0
    course.courseContent?.map((chapter) => chapter.chapterContent.map(
      (lecture) => time += lecture.lectureDuration
    ))
    return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] })
  }

  // Function to calculate number of lectures in a course
  const calculateTotalNoLectures = (course) => {
    let totalLectures = 0;
    course.courseContent?.forEach(chapter => {
      if (Array.isArray(chapter.chapterContent)) {
        totalLectures += chapter.chapterContent.length;
      }
    });
    return totalLectures;
  }

  // Fetch user enrolled courses
  const fetchUserEnrolledCourses = async () => {
    try {
      const token = await getToken()
      const { data } = await axios.get(backendUrl + '/api/user/enrolled-courses', { headers: { Authorization: `Bearer ${token}` } })
      if (data.success) {
        setEnrolledCourses(data.enrolledCourses.reverse())
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const value = {
    currency,
    allCourses,
    navigate,
    calculateRating,
    isEducator,
    setIsEducator,
    calculateChapterTime,
    calculateCourseDuration,
    calculateTotalNoLectures,
    enrolledCourses,
    fetchUserEnrolledCourses,
    backendUrl,
    userData,
    setUserData,
    getToken,
    fetchAllCourses,
  }


  useEffect(() => {
    fetchAllCourses();
  }, [])

  useEffect(() => {
    if (user) {
      fetchUserData()
      fetchUserEnrolledCourses();
    }
  }, [user])


  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  )
}