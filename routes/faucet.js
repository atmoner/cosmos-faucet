/**
 * @swagger
 * tags:
 *   name: Claim
 *   description: Claim your tokens
 * /faucet/claim/{address}:
 *   get:
 *     summary: Claim your tokens now
 *     tags: [Claim]
 *     parameters:
 *       - in: path
 *         name: address
 *         schema:
 *           type: string
 *         required: true
 *         description: address to claim 
 *     responses:
 *       200:
 *         description: Rerurns transaction informations
 *       403:
 *         description: Forbidden
 *   name: Query 
 * /faucet/available:
 *   get:
 *     summary: Total token available on faucet
 *     tags: [Query] 
 *     responses:
 *       200:
 *         description: Get total token available on faucet
 * /faucet/last-claim:
 *   get:
 *     summary: Get last claim on faucet
 *     tags: [Query] 
 *     responses:
 *       200:
 *         description: Get last claim on faucet
 */
