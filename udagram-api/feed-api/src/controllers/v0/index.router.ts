import {Router, Request, Response} from 'express';
import {FeedItem} from './models/FeedItem';
import {NextFunction} from 'connect';
import * as jwt from 'jsonwebtoken';
import * as AWS from '../../aws';
import * as c from '../../config/config';
import {uuid} from 'uuidv4'

const router: Router = Router();

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.headers || !req.headers.authorization) {
    return res.status(401).send({message: 'No authorization headers.'});
  }

  const tokenBearer = req.headers.authorization.split(' ');
  if (tokenBearer.length != 2) {
    return res.status(401).send({message: 'Malformed token.'});
  }

  const token = tokenBearer[1];
  return jwt.verify(token, c.config.jwt.secret, (err, decoded) => {
    if (err) {
      return res.status(500).send({auth: false, message: 'Failed to authenticate.'});
    }
    return next();
  });
}

// Get all feed items
router.get('/', async (req: Request, res: Response) => {
  const pid = uuid()

  console.log(new Date().toLocaleString() + `${pid} - Started get all feeds request`)

  const items = await FeedItem.findAndCountAll({order: [['id', 'DESC']]});
  items.rows.map((item) => {
    if (item.url) {
      item.url = AWS.getGetSignedUrl(item.url);
    }
  });
  res.send(items);

  console.log(new Date().toLocaleString() + `${pid} - Finished get all feeds request`)
});

// Get a feed resource
router.get('/:id',
    async (req: Request, res: Response) => {
      const pid = uuid()
      const {id} = req.params;

      console.log(new Date().toLocaleString() + `${pid} - Started get feed with id: ${id} request`)

      const item = await FeedItem.findByPk(id);
      res.send(item);

      console.log(new Date().toLocaleString() + `${pid} - Finished get feed with id: ${id} request`)
    });

// Get a signed url to put a new item in the bucket
router.get('/signed-url/:fileName',
    requireAuth,
    async (req: Request, res: Response) => {
      const {fileName} = req.params;

      const pid = uuid()

      console.log(new Date().toLocaleString() + `${pid} - Started get signed url for file: ${fileName} request`)

      const url = AWS.getPutSignedUrl(fileName);
      res.status(201).send({url: url});

      console.log(new Date().toLocaleString() + `${pid} - Finished get signed url for file: ${fileName} request`)
    });

// Create feed with metadata
router.post('/',
    requireAuth,
    async (req: Request, res: Response) => {
      const caption = req.body.caption;
      const fileName = req.body.url; // same as S3 key name

      const pid = uuid()

      console.log(new Date().toLocaleString() + `${pid} - Started post feed for file: ${fileName} request`)

      if (!caption) {
        return res.status(400).send({message: 'Caption is required or malformed.'});
      }

      if (!fileName) {
        return res.status(400).send({message: 'File url is required.'});
      }

      const item = await new FeedItem({
        caption: caption,
        url: fileName,
      });

      const savedItem = await item.save();

      savedItem.url = AWS.getGetSignedUrl(savedItem.url);
      res.status(201).send(savedItem);

      console.log(new Date().toLocaleString() + `${pid} - Finished post feed for file: ${fileName} request`)
    });

export const IndexRouter: Router = router;
