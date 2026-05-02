import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { createClient } from "@supabase/supabase-js"

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

// GET inventory with real time stock
app.get("/inventory", async (req, res) => {
  const { data: items } = await supabase.from("items").select("*")

  const { data: stockIn } = await supabase.from("stock_in").select("*")
  const { data: stockOut } = await supabase.from("stock_out").select("*")

  const result = items.map(item => {
    const totalIn = stockIn
      .filter(i => i.item_id === item.id)
      .reduce((sum, i) => sum + i.quantity, 0)

    const totalOut = stockOut
      .filter(i => i.item_id === item.id)
      .reduce((sum, i) => sum + i.quantity, 0)

    const currentStock = totalIn - totalOut

    return {
      ...item,
      totalIn,
      totalOut,
      currentStock,
      status: currentStock <= item.threshold ? "REORDER" : "OK"
    }
  })

  res.json(result)
})

// ADD ITEM
app.post("/items", async (req, res) => {
  const { name, sku, threshold } = req.body

  const { data, error } = await supabase
    .from("items")
    .insert([{ name, sku, threshold }])

  res.json({ data, error })
})

// STOCK IN
app.post("/stock-in", async (req, res) => {
  const { item_id, quantity, supplier } = req.body

  const { data, error } = await supabase
    .from("stock_in")
    .insert([{ item_id, quantity, supplier }])

  res.json({ data, error })
})

// STOCK OUT
app.post("/stock-out", async (req, res) => {
  const { item_id, quantity, reason } = req.body

  const { data, error } = await supabase
    .from("stock_out")
    .insert([{ item_id, quantity, reason }])

  res.json({ data, error })
})

app.listen(3000, () => console.log("Server running on port 3000"))