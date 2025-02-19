import { Variant } from "../../models/variant";
import { Product } from "../../models/product";
import { NextResponse } from "next/server";

export const GET = async (request) => {
    try { 
        
        // Extract query parameters from the request URL
        const { searchParams } = new URL(request.url);
        const sku = searchParams.get("sku"); // Get 'slug' from query params

      
        if (!sku) {
            return NextResponse.json({ message: "Sku parameter is required" }, { status: 400 });
        }

        const page = await Variant.findOne({sku:sku});

        if (page) {
            return NextResponse.json({ message: "Sku already exists", exists: true });
        }

        return NextResponse.json({ message: "Sku is available", exists: false });

    } catch (err) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
};