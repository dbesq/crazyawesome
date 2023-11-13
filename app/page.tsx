
import HeroCarousel from '@/components/HeroCarousel'
import Searchbar from '@/components/Searchbar'
import Image from 'next/image'
import React from 'react'
import { getAllProducts } from '@/lib/actions'
import ProductCard from '@/components/ProductCard'
import Link from 'next/link'

const Home = async () => {
  const allProducts = await getAllProducts()

  return (
    <>
      <section className="px-6 md:px-20 py-24">
        <div className="flex max-xl:flex-col gap-16">
          <div className="flex flex-col justify-center">
            <p className="small-text">
              Smart Shopping Starts Here 
              <Image
                src='/assets/icons/arrow-right.svg'
                alt='arrow-right'
                width={16}
                height={16}
              />
            </p>

            <h1 className="head-text">
              Unleash the Power of 
              <span className="text-primary"> Crazy Awesome Deals</span>
            </h1>

            <p className="mt-6">
              Powerful, self-serve product and growth analytics to help you convert, engage, and retain more.
            </p>

            <Searchbar />
          </div>

          <HeroCarousel />
        </div>
      </section>

      <div className="trending-section">
        <h2 className='section-text'>Trending</h2>

        <div className="flex flex-wrap gap-x-8 pag-y-16">
          {
            allProducts?.map((product) => (
              <Link href={`/products/${product._id}`} className='product-card'>
                <div className='product-card_img-container' key={product.title}>
                  <Image
                    src={product.image}
                    alt={product.title}
                    width={200}
                    height={200}
                    className='product-card_img'
                  />
                </div>

                <div className='flex flex-col gap-3'>
                  <h3 className='product-title'>{product.title}</h3>

                  <div className="flex justify-between">
                    <p className="text-black opacity-50 text-lg capitalize">
                      {product.category}
                    </p>

                    <p className='text-black text-lg font-semibold'>
                      <span>{product?.currency}</span>
                      <span>{product?.currentPrice}</span>
                    </p>
                  </div>
                </div>
              </Link>
            ))
          }
        </div>
      </div>
    </>
    
  )
}

export default Home