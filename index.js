const express =require("express")
const cors =require('cors')
const cookieParser =require("cookie-parser")
const app =express()
require('dotenv').config()
const jwt =require("jsonwebtoken")


app.use(cors({
  origin:['http://localhost:5173'],
  credentials:true
}));
app.use(express.json())
app.use(cookieParser())
  const port =process.env.PORT || 3006



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qjppvab.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const logger=async(req,res,next)=>{
  console.log('called',req.host,req.originalUrl)
  next()
}
const verifyToken=async(req,res,next)=>{
  const token =req.cookies?.token
  if(!token){
      return res.status(401).send({message:'forbidden'})
  }
  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
      if(err){
          return res.status(401).send({message:'unauthorized'})
      }
      console.log('value',decoded)
      req.user=decoded
      next()
  })
 
 
}

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    //await client.connect();
    const blogCollection =client.db("Blogs").collection("Blogs")
    const commentCollection =client.db("Comments").collection("Comments")
    const wishListCollection =client.db("wishlist").collection("wishlist")
    app.post('/jwt', async (req, res) => {
      const user = req.body;
      console.log('user for token', user);
    
      if (!user) {
        return res.status(400).send({ success: false, message: 'Invalid user data' });
      }
    
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
      console.log(token)
      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        // sameSite: "none"
      }).send({ success: true });
    });
  app.post('/logout',async(req,res)=>{
      const user = req.body
      console.log('logging Out ',user)
      res.clearCookie('token',{maxAge:0}).send({success:true})
  })
    app.post('/blogs',async(req,res)=>{
        const blog =req.body
        
        const result =await blogCollection.insertOne(blog)
      
        res.send(result)
    })
    app.post('/wishlist',async(req,res)=>{
        const blog =req.body
        
        console.log(blog)
        const result =await wishListCollection.insertOne(blog)
      
        res.send(result)
    })
    app.get('/wishlist',logger,verifyToken,async(req,res)=>{  
      if(req.query.email !== req.user.email){
        return res.status(403).send({message:"forbiden"})
    }
    let query ={}
        if(req.query?.email){
            query ={email:req.query.email}
        }
      const result =await wishListCollection.find(query).toArray()
      res.send(result)
  })
  app.delete('/wishlist/:id',async(req,res)=>{
    const id =req.params.id
    const query ={_id: new ObjectId(id)}
    const result =await wishListCollection.deleteOne(query)
    res.send(result)
})
    app.get('/blogs',async(req,res)=>{  
        const result =await blogCollection.find().toArray()
        res.send(result)
    })
    app.get('/blogs/:id',async(req,res)=>{
      const id =req.params.id
      const query ={_id: new ObjectId(id)}
      const result =await blogCollection.findOne(query)
      
      res.send(result)
    })
    app.post('/comments',async(req,res)=>{
      const blog =req.body
      console.log(blog)
      const result =await commentCollection.insertOne(blog)
    
      res.send(result)
  })
  app.get('/comments',async(req,res)=>{  
    const result =await commentCollection.find().toArray()
    res.send(result)
})
app.put('/blogs/:id',async(req,res)=>{
  const id =req.params.id
  const data =req.body

  const filter ={_id:  new ObjectId (id) }
  const options ={upsert:true}
  const updatedData ={
    $set:{
      image:data.image,
      title:data.title,
     category:data.category,
      shortDescription:data.shortDescription,
      longDescription:data.longDescription,
      
    }
  }
  const result =await blogCollection.updateOne(filter,updatedData,options)
  res.send(result)
})

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
   // await client.close();
  }
}
run().catch(console.dir);


  app.get('/',(req,res)=>{
    res.send('crud is running')
})
app.listen(port,()=>{
    console.log(`app is running ${port}`)
})