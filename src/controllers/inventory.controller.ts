import type { Request, Response } from "express";
import fs from "fs/promises";
import path from "path";
import type { InventoryItem } from "../types/inventory.js";

const DATA_PATH = path.resolve("src/data/inventory.json");

const getDB = async (): Promise<InventoryItem[]> => {
  try {
    const data = await fs.readFile(DATA_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const saveDB = async (data: InventoryItem[]) => {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2));
};

export const createItem = async (req: Request, res: Response) => {
  try {
    const { name, description, category, stock } = req.body;
    const items = await getDB();

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Name is required" });
    }
    if (stock === undefined || stock < 0) {
      return res.status(400).json({ message: "Stock cannot be negative" });
    }

    const lastId =
      items.length > 0 ? Math.max(...items.map((i) => Number(i.id))) : 0;
    const newId = (lastId + 1).toString();

    const newItem: InventoryItem = {
      id: newId,
      name,
      description,
      category,
      stock: Number(stock),
      createdAt: new Date().toISOString(),
      updatedAt: null,
      deletedAt: null,
    };

    items.push(newItem);
    await saveDB(items);

    res.status(201).json({
      message: "Inventory created successfully",
      data: newItem,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllItems = async (req: Request, res: Response) => {
  try {
    let items = await getDB();
    const { search, category } = req.query;

    items = items.filter((item) => item.deletedAt === null);

    if (search) {
      const term = (search as string).toLowerCase();
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(term) ||
          i.description.toLowerCase().includes(term),
      );
    }

    if (category) {
      items = items.filter((i) => i.category === category);
    }

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getItemById = async (req: Request, res: Response) => {
  try {
    const items = await getDB();
    const item = items.find(
      (i) => String(i.id) === String(req.params.id) && i.deletedAt === null,
    );

    if (!item) {
      return res.status(404).json({ message: "Inventory not found" });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateItem = async (req: Request, res: Response) => {
  try {
    const items = await getDB();
    const { id } = req.params;
    const { stock, ...updates } = req.body;

    const itemExisting = items.find(
      (i) => String(i.id) === String(id) && i.deletedAt === null,
    );

    if (!itemExisting) {
      return res.status(404).json({ message: "Inventory not found" });
    }

    if (stock !== undefined && stock < 0) {
      return res.status(400).json({ message: "Stock cannot be negative" });
    }

    const updatedItem: InventoryItem = {
      ...itemExisting,
      ...updates,
      stock: stock !== undefined ? Number(stock) : itemExisting.stock,
      updatedAt: new Date().toISOString(),
    };

    const index = items.findIndex((i) => String(i.id) === String(id));
    items[index] = updatedItem;

    await saveDB(items);

    res.json({
      message: "Inventory updated successfully",
      data: updatedItem,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const softDelete = async (req: Request, res: Response) => {
  try {
    const items = await getDB();
    const { id } = req.params;

    const item = items.find((i) => String(i.id) === String(id));

    if (!item) {
      return res.status(404).json({ message: "Inventory not found" });
    }

    if (item.deletedAt !== null) {
      return res.status(400).json({ message: "Item is already deleted" });
    }

    item.deletedAt = new Date().toISOString();

    await saveDB(items);
    res.json({ message: "Item soft-deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const hardDelete = async (req: Request, res: Response) => {
  try {
    const items = await getDB();
    const { id } = req.params;

    const filteredItems = items.filter((i) => String(i.id) !== String(id));

    if (items.length === filteredItems.length) {
      return res.status(404).json({ message: "Inventory not found" });
    }

    await saveDB(filteredItems);
    res.json({ message: "Item permanently removed from database" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};
