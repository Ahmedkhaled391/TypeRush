//function Footer() {
//    return ( <>
//        <footer className="bg-black grid gap-5 grid-cols-1 sm:grid-cols-6  min-h-92">
//            <div className="text flex flex-col items-center gap-3  mx-6 text-center mt-6">
//                <h1 className="text-emerald-500 text-3xl font-bold">
//                    TypeRush
//                </h1>
//                <p className="paragraph-muted-sm self-center line-clamp-no-ellipsis ">
//                    &copy; 2024 TypeRush. The typing experience, solo practise and 1v1 challenges, All rights reserved.
//                </p>
//                <div className="links flex gap-5">
//                    <a href="https://www.linkedin.com/in/ahmed-khaled-7835b9331" target="_blank" rel="noreferrer" aria-label="LinkedIn">
//                        <i className="fa-brands fa-linkedin text-2xl hover:text-cyan-500 transition-colors"></i>
//                    </a>
//                    <a href="https://www.instagram.com/ahmedkhaled39119/" target="_blank" rel="noreferrer" aria-label="Instagram">
//                        <i className="fa-brands fa-instagram text-2xl hover:text-pink-500 transition-colors"></i>
//                    </a>
//                </div>
//            </div>
//        </footer>
    
//    </> );
//}
function Footer() {
    return (
        <footer className="bg-black flex flex-col  gap-6 min-h-92 py-8 px-6">
            <div className="flex flex-col gap-5">

            <h1 className="text-emerald-500 text-3xl font-bold">
                TypeRush
            </h1>
            
            <p className="paragraph-muted-sm line-clamp-no-ellipsis max-w-sm">
                &copy; 2024 TypeRush. The typing experience, solo practise and 1v1 challenges, All rights reserved.
            </p>
            
            <div className="links flex gap-5">
                <a href="https://www.linkedin.com/in/ahmed-khaled-7835b9331" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                    <i className="fa-brands fa-linkedin text-2xl hover:text-cyan-500 transition-colors"></i>
                </a>
                <a href="https://www.instagram.com/ahmedkhaled39119/" target="_blank" rel="noreferrer" aria-label="Instagram">
                    <i className="fa-brands fa-instagram text-2xl hover:text-pink-500 transition-colors"></i>
                </a>
            </div>
            </div>
        </footer>
    );
}

export default Footer;