
import BlogsSection from '@/components/sections/BlogsSection'
import EnquiryPopup from '@/components/sections/EnquiryPopup'
import HeroSection from '@/components/sections/HeroSection'
import HotestProp from '@/components/sections/HotestProp'
import LuxurySlider from '@/components/sections/LuxurySlider'
import NewsletterSection from '@/components/sections/NewsletterSection'
import RecentProp from '@/components/sections/RecentProp'
import TestimonialSection from '@/components/sections/TestimonialSection'
import { fetchBlogs, fetchProperties, fetchTestimonial } from '@/lib/actions'



const page = async () => {
  const [properties, blogs, testimonials] = await Promise.all([
    fetchProperties(),
    fetchBlogs(),
    fetchTestimonial()
  ])

  return (
    <div>
      <EnquiryPopup />
      <HeroSection />
      <LuxurySlider properties={properties} />
      <RecentProp properties={properties} />
      <HotestProp properties={properties} />
      <BlogsSection blogs={blogs} />
      <TestimonialSection testimonials={testimonials} />
      <NewsletterSection />

    </div>
  )
}

export default page