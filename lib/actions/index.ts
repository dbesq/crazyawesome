'use server'
import { revalidatePath } from "next/cache"
import { connectToDB } from "../mongoose"
import Product from "../models/product.model"
import { User } from "@/types"
import { scrapeAmazonProduct } from "../scraper"
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils"
import { generateEmailBody, sendEmail } from "../nodemailer"

export async function scrapeAndStoreProduct(productUrl: string) {
    if(!productUrl) return

    try {
        connectToDB()

        const scrapedProduct: any = await scrapeAmazonProduct(productUrl)
        
        if(!scrapedProduct) {
            console.log(`actions/index: No scraped product`)
        }

        console.log(`actions/index: Scraped product!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`)
        console.log(`actions/index: productUrl: ${productUrl}`)
        console.log(typeof productUrl)
        let product = scrapedProduct

        const existingProduct = await Product.findOne({ url: scrapedProduct.url })

        if(existingProduct) {
            const updatedPriceHistory: any = [
                ...existingProduct.priceHistory,
                { price: scrapedProduct.currentPrice }
            ]

            product = {
                ...scrapedProduct,
                priceHistory: updatedPriceHistory,
                lowestPrice: getLowestPrice(updatedPriceHistory),
                highestPrice: getHighestPrice(updatedPriceHistory),
                averagePrice: getAveragePrice(updatedPriceHistory),
            }
        }

        

        const newProduct = await Product.findOneAndUpdate(
            { url: scrapedProduct.url },
            product,
            // if Product doesn't exist:
            {
                upsert: true,
                new: true,
            }
        )

        console.log(`newProduct saved!!!`)

        // Revalidate the product url so NextJS knows it changed
        revalidatePath(`/products/${newProduct._id}`)
    } catch (error: any) {
        console.error(`lib/actions create product error: ${error}`)
        throw new Error(`Failed to create/update product: ${error.message}`)
    }
}

export async function getProductById(productId: string) {
    connectToDB()

    try {
        const product = await Product.findOne({ _id: productId })
        if(!product) return null

        return product 

    } catch (error: any) {
        console.error(`lib/actions find product error: ${error}`)
        throw new Error(`Failed to find product: ${error.message}`)
    }
}

export async function getAllProducts() {
    connectToDB()

    try {
        const products = await Product.find()

        return products
    } catch (error: any) {
        console.error(`lib/actions find all products error: ${error}`)
        throw new Error(`Failed to fetch all products: ${error.message}`)        
    }
}

export async function getSimilarProducts(productId: string) {
    connectToDB()

    try {
        const currentProduct = await Product.findById({ _id: productId })

        if(!currentProduct) return null 

        const similarProducts = await Product.find({
            _id: { $ne: productId },
        }).limit(3)

        return similarProducts
    } catch (error: any) {
        console.error(`lib/actions find similar products error: ${error}`)
        throw new Error(`Failed to fetch similar products: ${error.message}`)        
    }
}

export async function addUserEmailToProduct(productId: string, userEmail: string) {
    try {
        connectToDB()
        // Send first email
        const product = await Product.findById(productId)
        if(!product) return null

        // Is user on list of users f/ product?
        const userExists = product.users.some((user: User) => user.email === userEmail)
        if(!userExists) {
            product.users.push({email: userEmail})
            await product.save()

            const emailContent = await generateEmailBody(product, "WELCOME")

            await sendEmail(emailContent, [userEmail])
        }

    } catch (error: any) {
        console.error(`lib/actions add email to products error: ${error}`)
        throw new Error(`Failed to add email to products: ${error.message}`)   
    }
}

