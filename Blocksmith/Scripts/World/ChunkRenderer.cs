using UnityEngine;

namespace Blocksmith.World
{
    [RequireComponent(typeof(MeshFilter), typeof(MeshRenderer))]
    public class ChunkRenderer : MonoBehaviour
    {
        public Chunk chunk;

        public void Rebuild()
        {
            if (chunk == null) return;
            var mesh = new Mesh();
            var verts = new System.Collections.Generic.List<Vector3>();
            var tris = new System.Collections.Generic.List<int>();
            var norms = new System.Collections.Generic.List<Vector3>();

            // Very naive: only top faces for demonstration
            for (int x = 0; x < Chunk.Width; x++)
            for (int z = 0; z < Chunk.Depth; z++)
            {
                int y = FindTopY(x, z);
                if (y < 0) continue;
                AddQuad(verts, tris, norms, new Vector3(x, y + 1, z), Vector3.right, Vector3.forward);
            }

            mesh.SetVertices(verts);
            mesh.SetTriangles(tris, 0);
            mesh.SetNormals(norms);
            GetComponent<MeshFilter>().sharedMesh = mesh;
        }

        private int FindTopY(int x, int z)
        {
            for (int y = Chunk.Height - 2; y >= 0; y--)
            {
                if (!chunk.GetBlock(x, y, z).IsAir) return y;
            }
            return -1;
        }

        private void AddQuad(System.Collections.Generic.List<Vector3> v, System.Collections.Generic.List<int> t, System.Collections.Generic.List<Vector3> n, Vector3 origin, Vector3 right, Vector3 forward)
        {
            int idx = v.Count;
            v.Add(origin);
            v.Add(origin + forward);
            v.Add(origin + forward + right);
            v.Add(origin + right);
            t.Add(idx + 0); t.Add(idx + 1); t.Add(idx + 2);
            t.Add(idx + 0); t.Add(idx + 2); t.Add(idx + 3);
            Vector3 normal = Vector3.up;
            n.Add(normal); n.Add(normal); n.Add(normal); n.Add(normal);
        }
    }
}