import { createContext, useEffect, useState } from "react";
import { dummyCourses } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import humanizeDuration from "humanize-duration";

export const AppContext = createContext({})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const AppContextProvider = (props: any) => {
  const currency = import.meta.env.VITE_CURRENCY
  const navigate = useNavigate()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [isEducator, setIsEducator] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  const fetchAllCourses = async () => {
    setAllCourses(dummyCourses)
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
    return totalRating / course.courseRatings.length;
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
    course.courseContent.map((chapter) => chapter.chapterContent.map(
      (lecture) => time += lecture.lectureDuration
    ))
    return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] })
  }

  // Function to calculate number of lectures in a course
  const calculateTotalNoLectures = (course) => {
    let totalLectures = 0;
    course.courseContent.forEach(chapter => {
      if (Array.isArray(chapter.chapterContent)) {
        totalLectures += chapter.chapterContent.length;
      }
    });
    return totalLectures;
  }

  // Fetch user enrolled courses
  const fetchUserEnrolledCourses = async () => {
    setEnrolledCourses(dummyCourses)
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
  }

  useEffect(() => {
    fetchAllCourses();
    fetchUserEnrolledCourses();
  }, [])


  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  )
}