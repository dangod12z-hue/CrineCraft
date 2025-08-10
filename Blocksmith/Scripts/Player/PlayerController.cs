using UnityEngine;
using Blocksmith.Items;

namespace Blocksmith.Player
{
    [RequireComponent(typeof(CharacterController))]
    public class PlayerController : MonoBehaviour
    {
        public PlayerGameMode Mode = PlayerGameMode.Survival;
        public float walkSpeed = 5f;
        public float flySpeed = 12f;
        private CharacterController _cc;
        private Vector3 _velocity;
        public Inventory Inventory { get; private set; } = new Inventory(36);

        private void Awake()
        {
            _cc = GetComponent<CharacterController>();
        }

        private void Update()
        {
            Vector3 input = new Vector3(Input.GetAxis("Horizontal"), 0, Input.GetAxis("Vertical"));
            input = transform.TransformDirection(input);

            bool isFlying = Mode == PlayerGameMode.Spectator || (Mode == PlayerGameMode.Creative && Input.GetKey(KeyCode.Space));
            _cc.detectCollisions = !isFlying;
            _cc.enableOverlapRecovery = !isFlying;

            if (isFlying)
            {
                float speed = flySpeed;
                Vector3 move = input * speed;
                if (Input.GetKey(KeyCode.E)) move.y += speed;
                if (Input.GetKey(KeyCode.Q)) move.y -= speed;
                _cc.Move(move * Time.deltaTime);
            }
            else
            {
                Vector3 move = input * walkSpeed;
                if (_cc.isGrounded)
                {
                    _velocity.y = -1f;
                    if (Input.GetKeyDown(KeyCode.Space)) _velocity.y = 5f;
                }
                _velocity.y += Physics.gravity.y * Time.deltaTime;
                _cc.Move((move + _velocity) * Time.deltaTime);
            }
        }
    }
}