'use client'

import { scrapeAndStoreProduct } from "@/lib/actions"
import { FormEvent, useState } from "react"

const isValidAmazonProductURL = (url: string) => {
    try {
        const parsedURL = new URL(url)
        const hostname = parsedURL.hostname

        if(
            hostname.includes('bestbuy.com') ||
            hostname.includes('bestbuy.') ||
            hostname.endsWith('bestbuy')
        ) {
            return true
        }
    } catch (error) {
        console.error(`Searchbar error, not valid URL, ${error}`)
        return false
    }
    return false
}

const Searchbar = () => {
    // Keep track of URL
    const [searchPrompt, setSearchPrompt] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        // is Url a valid link
        const isValidLink = isValidAmazonProductURL(searchPrompt)
        if(!isValidLink) return alert(`Please provide a valid bestbuy link`)

        // return alert(isValidLink ? 'Valid Link' : 'Invalid Link')
        try {
            setIsLoading(true)

            // Scrape product page
            const product = await scrapeAndStoreProduct(searchPrompt)
        } catch (error) {
            console.error(`Searchbar error: ${error}`)
        } finally {
            setIsLoading(false)
        }
    }
    
  return (
    <form 
        className="flex flex-wrap gap-4 mt-12"
        onSubmit={handleSubmit}
    >
        <input
            type='text'
            value={searchPrompt}
            onChange={(e) => setSearchPrompt(e.target.value)}
            placeholder='Enter product link'
            className='searchbar-input'
        />

        <button
            type='submit'
            className="searchbar-btn"
            disabled={searchPrompt === ''}
        >
            {
                isLoading ? 'Searching ...' : 'Search'
            }
        </button>
    </form>
  )
}

export default Searchbar