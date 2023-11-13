import { connectToDB } from "@/lib/mongoose"
import Product from '@/lib/models/product.model'
import { scrapeAmazonProduct } from "@/lib/scraper"
import { getAveragePrice, getEmailNotifType, getHighestPrice, getLowestPrice } from "@/lib/utils"
import { generateEmailBody, sendEmail } from "@/lib/nodemailer"

export const maxDuration = 300; // This function can run for a maximum of 300 seconds
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
    try {
        connectToDB()

        const products = await Product.find({})
        if (!products) throw new Error('No products found')

        // Scrape latest product details and update DB
        const updatedProducts = await Promise.all(
            products.map(async (currentProduct) => {
                const scrapedProduct = await scrapeAmazonProduct(currentProduct.url)
                if (!scrapedProduct) throw new Error('No product found')

                const updatedPriceHistory = [
                    ...currentProduct.priceHistory,
                    { price: scrapedProduct.currentPrice }
                ]

                const product = {
                    ...scrapedProduct,
                    priceHistory: updatedPriceHistory,
                    lowestPrice: getLowestPrice(updatedPriceHistory),
                    highestPrice: getHighestPrice(updatedPriceHistory),
                    averagePrice: getAveragePrice(updatedPriceHistory),
                }

                const updatedProduct = await Product.findOneAndUpdate(
                    { url: product.url },
                    product,
                )
                // Check product status and update
                // -- Get Notification Type
                const emailNotifType = getEmailNotifType(scrapedProduct, currentProduct)
                // -- If there's an update and the product has users associated with it, email
                if(emailNotifType && updatedProduct.users.length > 0) {
                    const productInfo = {
                        title: updatedProduct.title,
                        url: updatedProduct.url,
                    }
                    const emailContent = await generateEmailBody(productInfo, emailNotifType)

                    // -- Get array of all user emails for the product and send emails
                    const userEmails = updatedProduct.users.map((user: any) => user.email)
                    await sendEmail(emailContent, userEmails)
                }

                return updatedProduct
            })
        )
    } catch (error) {
        throw new Error(`Error in Get: ${error}`)
    }
}