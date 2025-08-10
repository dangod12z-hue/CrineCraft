using UnityEngine;
using Blocksmith.World;

namespace Blocksmith.Player
{
    public class BlockInteractor : MonoBehaviour
    {
        public Camera playerCamera;
        public float reach = 6f;
        public BlockId placeBlock = BlockId.Stone;

        private void Update()
        {
            if (playerCamera == null) return;
            if (Input.GetMouseButtonDown(0)) // break
            {
                if (TryRaycast(out Vector3Int hitPos, out Vector3Int normal))
                {
                    var chunk = WorldManager.Instance.GetOrCreateChunk(Mathf.FloorToInt((float)hitPos.x / Chunk.Width), Mathf.FloorToInt((float)hitPos.z / Chunk.Depth));
                    int lx = (hitPos.x % Chunk.Width + Chunk.Width) % Chunk.Width;
                    int ly = Mathf.Clamp(hitPos.y, 0, Chunk.Height - 1);
                    int lz = (hitPos.z % Chunk.Depth + Chunk.Depth) % Chunk.Depth;
                    chunk.SetBlock(lx, ly, lz, Block.Air);
                }
            }
            else if (Input.GetMouseButtonDown(1)) // place
            {
                if (TryRaycast(out Vector3Int hitPos, out Vector3Int normal))
                {
                    Vector3Int placePos = hitPos + normal;
                    var chunk = WorldManager.Instance.GetOrCreateChunk(Mathf.FloorToInt((float)placePos.x / Chunk.Width), Mathf.FloorToInt((float)placePos.z / Chunk.Depth));
                    int lx = (placePos.x % Chunk.Width + Chunk.Width) % Chunk.Width;
                    int ly = Mathf.Clamp(placePos.y, 0, Chunk.Height - 1);
                    int lz = (placePos.z % Chunk.Depth + Chunk.Depth) % Chunk.Depth;
                    chunk.SetBlock(lx, ly, lz, new Block { Id = placeBlock });
                }
            }
        }

        private bool TryRaycast(out Vector3Int blockPos, out Vector3Int normal)
        {
            blockPos = Vector3Int.zero; normal = Vector3Int.zero;
            if (Physics.Raycast(playerCamera.transform.position, playerCamera.transform.forward, out var hit, reach))
            {
                Vector3 p = hit.point - hit.normal * 0.01f;
                blockPos = new Vector3Int(Mathf.FloorToInt(p.x), Mathf.FloorToInt(p.y), Mathf.FloorToInt(p.z));
                normal = Vector3Int.RoundToInt(hit.normal);
                return true;
            }
            return false;
        }
    }
}