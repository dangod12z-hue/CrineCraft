using System;
using System.Collections.Generic;
using System.Linq;

namespace Blocksmith.Items
{
    public class Inventory
    {
        private readonly List<ItemStack> _slots;

        public Inventory(int size)
        {
            _slots = new List<ItemStack>(size);
            for (int i = 0; i < size; i++) _slots.Add(new ItemStack());
        }

        public IEnumerable<ItemStack> Slots => _slots;

        public bool Add(Item item, int count)
        {
            // Try to stack first
            foreach (var s in _slots)
            {
                if (!s.IsEmpty && s.Item == item && s.Count < s.Item.MaxStack)
                {
                    int canAdd = (int)Math.Min(count, s.Item.MaxStack - s.Count);
                    s.Count += canAdd;
                    count -= canAdd;
                    if (count <= 0) return true;
                }
            }
            // Then empty slots
            foreach (var s in _slots)
            {
                if (s.IsEmpty)
                {
                    s.Item = item; s.Count = count;
                    return true;
                }
            }
            return false;
        }

        public IEnumerable<ItemStack> Search(string query)
        {
            query = query?.ToLowerInvariant() ?? string.Empty;
            return _slots.Where(s => !s.IsEmpty && (s.Item.DisplayName?.ToLowerInvariant().Contains(query) == true || s.Item.Id.ToLowerInvariant().Contains(query)));
        }

        public IEnumerable<ItemStack> Filter(Func<ItemStack, bool> predicate)
        {
            return _slots.Where(predicate);
        }
    }
}