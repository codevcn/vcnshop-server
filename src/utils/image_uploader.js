import cloudinary from 'cloudinary'
import '../configs/cloudinary.js'

class ImageUploader {
    get_data_uri(mimetype, data) {
        return `data:${mimetype};base64,${data.toString('base64')}`
    }

    async uploadOneImage(image_to_upload, public_id, folder_of_uploading) {
        //delete the old avatar before upload
        await cloudinary.v2.api.delete_resources_by_prefix(folder_of_uploading)

        let data_uri = this.get_data_uri(image_to_upload.mimetype, image_to_upload.data)

        let options = { folder: folder_of_uploading }
        if (public_id) options.public_id = public_id
        else options.use_filename = true

        let response = await cloudinary.v2.uploader.upload(
            data_uri,
            options
        )

        return response.secure_url
    }

    async uploadImages(images_to_upload, folder_of_uploading) {
        //delete the old images before upload
        await cloudinary.v2.api.delete_resources_by_prefix(folder_of_uploading)

        //check if files is iterable
        if (!Array.isArray(images_to_upload))
            images_to_upload = [images_to_upload]

        let data_uri
        let image_urls = await Promise.all(
            images_to_upload.map(({ data, mimetype }) => {
                data_uri = this.get_data_uri(mimetype, data)
                return cloudinary.v2.uploader.upload(
                    data_uri,
                    {
                        use_filename: true,
                        unique_filename: true,
                        folder: folder_of_uploading,
                    },
                )
            })
        )

        image_urls = image_urls.map(({ secure_url }) => secure_url)

        return image_urls
    }

    async uploadUserAvatar(image_to_upload, user_id) {
        let public_id = 'avatar.' + image_to_upload.mimetype.split('/')[0]
        let folder_of_uploading = 'users/' + user_id + '/profile'

        return await this.uploadOneImage(image_to_upload, public_id, folder_of_uploading)
    }

    async uploadReviewImages(images_to_upload, product_id, user_id) {
        let folder_of_uploading = 'products/' + product_id + '/reviews/' + user_id

        return await this.uploadImages(images_to_upload, folder_of_uploading)
    }

    async uploadProductImages(images_to_upload, product_id) {
        let folder_of_uploading = 'products/' + product_id + '/product_images'

        return await this.uploadImages(images_to_upload, folder_of_uploading)
    }

    checkFilesExists(files, input_name) {
        if (files && files[input_name])
            return true

        return false
    }
}

const imageUploader = new ImageUploader()

export default imageUploader