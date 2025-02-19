import { Product } from "../../models/product";
import { NextResponse } from "next/server";

export const GET = async (request) => {
    try { 
        
        // Extract query parameters from the request URL
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get("slug"); // Get 'slug' from query params
      console.log(slug);
      
        if (!slug) {
            return NextResponse.json({ message: "Slug parameter is required" }, { status: 400 });
        }

        const page = await Product.findOne({product_slug:slug});

        if (page) {
            return NextResponse.json({ message: "Slug already exists", exists: true });
        }

        return NextResponse.json({ message: "Slug is available", exists: false });

    } catch (err) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
};