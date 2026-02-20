



import { router } from "../settings/router.config.js";
import { app } from "../settings/app.config.js";

app.use(router)

const Start = () => {

    app.listen(3000, () => {
        console.log("i don start")
    })
}
Start()

router.get('/', (res, req) => {
    req.send("i don start o")
})

