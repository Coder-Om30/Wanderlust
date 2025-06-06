const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js"); 
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");

const lisitngController = require("../controllers/listings.js");

const multer = require("multer"); 
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage }); 


// Search route (must be before any '/:id' route)
router.get("/search", async (req, res) => {
    const { q } = req.query;
    let listings = [];
    if (q) {
        // Simple case-insensitive search by title or location
        listings = await Listing.find({
            $or: [
                { title: { $regex: q, $options: "i" } },
                { location: { $regex: q, $options: "i" } }
            ]
        });
    }
    res.render("listings/index", { allListings: listings });
});



router          
    .route("/")
    .get( wrapAsync (lisitngController.index)) //Index Route 
    .post(   //create route
        isLoggedIn,
        upload.single("listing[image]"),   
        validateListing,  
        wrapAsync(lisitngController.createListing)
    );
   

//New Route
router.get("/new", isLoggedIn, lisitngController.renderNewForm );


router
    .route("/:id")
    .get( wrapAsync (lisitngController.showListing))  //Show route
    .put(  //update route
        isLoggedIn,
        isOwner,
        upload.single("listing[image]"),   
        validateListing, 
        wrapAsync(lisitngController.updateListing)
    )
    .delete(  //delete route
        isLoggedIn,  
        isOwner,
        wrapAsync(lisitngController.destroyListing)
    );
    
//Edit Route
router.get("/:id/edit", 
    isLoggedIn,
    isOwner,
    wrapAsync(lisitngController.renderEditForm));



module.exports = router;