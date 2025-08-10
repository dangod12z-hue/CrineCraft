namespace Blocksmith.Items
{
    public enum ItemType
    {
        Block,
        Consumable,
        Tool,
        Ingredient,
        Misc
    }

    public class Item
    {
        public string Id;
        public string DisplayName;
        public ItemType Type;
        public float MaxStack = 64;
    }

    public class ItemStack
    {
        public Item Item;
        public int Count;

        public bool IsEmpty => Item == null || Count <= 0;
    }
}