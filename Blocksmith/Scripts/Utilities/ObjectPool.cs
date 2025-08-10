using System.Collections.Generic;
using UnityEngine;

namespace Blocksmith.Utilities
{
    public class ObjectPool<T> where T : new()
    {
        private readonly Stack<T> _pool = new Stack<T>();

        public T Get()
        {
            return _pool.Count > 0 ? _pool.Pop() : new T();
        }

        public void Release(T obj)
        {
            _pool.Push(obj);
        }

        public void Clear() => _pool.Clear();
    }
}