import {Router, Request, Response} from 'express';

import {User} from './models/User';
import {AuthRouter} from './routes/auth.router';
import {uuid} from 'uuidv4'

const router: Router = Router();

router.use('/auth', AuthRouter);

router.get('/');

router.get('/:id', async (req: Request, res: Response) => {
  const {id} = req.params;

  const pid = uuid()

  console.log(new Date().toLocaleString() + `${pid} - Started get user for id: ${id}`)

  const item = await User.findByPk(id);
  res.send(item);

  console.log(new Date().toLocaleString() + `${pid} - Finished get user for id: ${id}`)
});

export const IndexRouter: Router = router;
