/** @type {import('next').NextConfig} */
const nextConfig = {
    images:{
        domains: ['fakeimg.pl','placeholder.jpg'],
    },
async redirects(){
    
    return[
        {
            source:"/",
            destination:"/products",
            permanent:false
        }

    ]
}

};

export default nextConfig;
