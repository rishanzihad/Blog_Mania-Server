const express =require("express")
const cors =require('cors')
const app =express()
require('dotenv').config()

app.use(cors())
app.use(express.json())
  
  const port =process.env.PORT || 3006

  app.get('/',(req,res)=>{
    res.send('crud is running')
})
app.listen(port,()=>{
    console.log(`app is running ${port}`)
})