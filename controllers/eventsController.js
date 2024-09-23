import Users from '../models/Users.js';
import Media from "../models/Media.js";
import Events from "../models/Events.js";
import EventInvitedes from "../models/Event.invitedes.js";
import fs from "fs";
import path from "path";
import {sendMail} from "../services/Mail.js";

export default {
    createEvents: async (req, res) => {
        if (!req?.files?.length) {
            res.status(422).send({
                message: 'Images are required.',
            });
            return
        }

        const files = req.files ? req.files.map(file => file.path.replace('public/', '')) : [];

        try {
            console.log(req.user)
            const {title,description, date, location} = req.body;
            const {id,email} = req.user;

            const event = await Events.create({
                title,
                description,
                date,
                location,
                userId: id,
            });

            const mediaEntries = files.map(filePath => ({
                path: filePath,
                eventId: event.id,
            }));

            await Media.bulkCreate(mediaEntries);



            console.log(email)
            console.log(id)
            await sendMail({
                to: email,
                subject: 'Welcome to event',
                template: 'invitationEvent',
                templateData: {
                    username: req.user.username,
                    title: title,
                    description:description,
                    date: date,
                    location: location,
                }
            })
            res.status(201).json({
                message: 'Post created successfully',
            });
        } catch (err) {
            console.error('Create Post Error :', err);
            if (req.files) {
                req.files.forEach(file => {
                    try {
                        fs.unlinkSync(path.resolve(file.path));
                    } catch (unlinkErr) {
                        console.error('Failed to delete file:', unlinkErr);
                    }
                });
            }

            res.status(500).json({
                message: 'Failed to create post',
                error: err.message,
            });
        }
    },

    getEvents: async (req, res) => {
        try {
            console.log(req.user)
            const {id: userId} = req.user;
            let page = +req.query.page;
            let limit = +req.query.limit;
            let offset = (page - 1) * limit;
            const totalPosts = Events.count()

            const maxPageCount = Math.ceil(totalPosts / limit);

            if (page > maxPageCount) {
                res.status(404).json({
                    message: 'Events does not found.',
                    events: []
                });
                return;
            }

            const events = await Events.findAll({
                where:{
                  userId: userId
                },
                include: [

                    {
                        model: Media,
                        as:'images'
                    },
                ],
                order: [['createdAt', 'DESC']],
                limit,
                offset,
            });
            res.status(200).json({
                message: 'Events list',
                page,
                limit,
                events
            });
        } catch (error) {
            console.error('Error fetching posts:', error);
            return res.status(500).json({
                message: 'Failed to fetch posts',
                error: error.message,
            });
        }
    },
    subscribeEvent: async (req, res) => {
        try {
            const { username, email } = req.body;
            const { id } = req.query;

            const event = await Events.findByPk(id);
            if (!event) {
                return res.status(404).json({ message: 'Event not found' });
            }

            const subscribeEvent = await EventInvitedes.create({
                username,
                email,
                registerId: event.id,
            });

            return res.status(201).json({
                message: 'Event subscribed successfully',
                subscribeEvent,
            });
        } catch (error) {
            console.error('Register Event Error:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },
    updateEvent: async (req, res) => {
        try {
            const { id } = req.params;
            const { id: userId } = req.user;
            const { title, description, dateTime, location } = req.body;
            const { files } = req.files ? req.files.path.replace('public/', '') : null;


            const event = await Events.findOne({
                where: { id, userId },
                include: {
                    model: Media,
                },
            });

            if (!event) {
                if (req.file) {
                    try {
                        await fs.unlinkSync(req.file.path);
                    } catch (unlinkErr) {
                        console.error('File removal failed:', unlinkErr);
                    }
                }
                return res.status(403).json({ message: 'You are not allowed to edit this event' });
            }

            await Events.update(
                { title, description, dateTime, location },
                { where: { id } }
            );

            const pathPhotos = await Media.findAll({ where: { eventId: event.id } });
            for (let i = 0; i < pathPhotos.length; i++) {
                const media = pathPhotos[i];
                try {
                    await fs.promises.unlink(path.resolve('public', media.path));
                } catch (error) {
                    console.error('Failed to delete old media file:', media.path, error);
                }
            }
            await Media.destroy({ where: { eventId: event.id } });
            if (files) {
                for (let photo of files) {
                    await Media.create({
                        path: files.path,
                        eventId: event.id,
                    });
                }
            }

            const subscribedUsers = await EventInvitedes.findAll({
                where: { registerId: event.id },
                attributes: ['email'],
            });

            for (const user of subscribedUsers) {
              await  sendMail({
                    to:  user.email,
                    subject: 'Event Update',
                    template: 'UpdatedEventPage',
                    templateData: {
                        title: event.title,
                        description: event.description,
                        dateTime: new Date(event.dateTime).toLocaleString(),
                        location: event.location,
                    },
                });
            }
            res.status(200).json({ message: 'Event updated successfully', event });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: error.message, status: 500 });
        }
    },

}