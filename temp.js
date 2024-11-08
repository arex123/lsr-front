import http from 'http'
const server = http.createServer((req,res)=>{
    console.log("hello ")
    res.write("hi from sever")
    res.end()
})


server.listen(4000,()=>{
    console.log("listenign ",400)
})
