import { Cloud as LafCloud, CloudOptions, Db } from 'laf-client-sdk'
import { S3, PutObjectCommand, PutObjectCommandInput } from '@aws-sdk/client-s3'

class Cloud {
  private readonly APPID: string = ''
  private _cloud: LafCloud | null = null
  private _database: Db | null = null

  constructor(appid: string, options?: Omit<CloudOptions, 'baseUrl'>) {
    this.APPID = appid
    this._cloud = new LafCloud({
      ...(options || {}),
      baseUrl: `https://${appid}.lafyun.com`
    })
  }

  public invoke(functionName: string, data?: { [key: string]: any }) {
    return (this._cloud as LafCloud).invoke(functionName, data ?? {})
  }

  public get database() {
    if (!this._database) {
      this._database = (this._cloud as LafCloud).database()
    }
    return this._database
  }

  public upload(key: string, body: PutObjectCommandInput['Body'], contentType: string, functionName: string = 'get-sts', bucketSuffix: string = 'public') {
    return (this._cloud as LafCloud).invokeFunction(functionName, {})
      .then(({ credentials, endpoint, region }) => {
        const s3 = new S3({
          endpoint,
          region,
          credentials: {
            accessKeyId: credentials.AccessKeyId,
            secretAccessKey: credentials.SecretAccessKey,
            sessionToken: credentials.SessionToken,
            expiration: credentials.Expiration
          },
          forcePathStyle: true
        })

        const bucket = `${this.APPID}-${bucketSuffix}`
        const cmd = new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: body,
          ContentType: contentType
        })

        return s3.send(cmd)
      })
  }
}

export default Cloud
