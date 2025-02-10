import mongoose from 'mongoose';
const { Schema } = mongoose;

const LibownerSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    profileImg: {
        type: String,
        default: '0'
    },
    ownername: {
        type: String,
        required: true
    },
    libname: {
        type: String,
        default: null
    },
    contactnum: {
        type: Number,
        required: true
    },
    libcontactnum: {
        type: Number,
        default: null
    },
    aadharnum: {
        type: Number,
        default: null
    },
    localarea: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    pin: {
        type: Number,
        required: true
    },
    googlemap: {
        type: String,
        default: null
    },
    ytvideo: {
        type: [],
        default: []
    },
    floors: {
        type: [
            {
                shifts: {
                    type: [
                        {
                            stTime: { type: Number, default: 7 },
                            endTime: { type: Number, default: 12 },
                            description: { type: String, default: '' },
                            price: {
                                type: [
                                    {
                                        actualPrice: { type: Number, default: 700 },
                                        discountPrice: { type: Number, default: 500 },
                                        duration: { type: String, default: '30 Days' }
                                    }
                                ],
                                default: [
                                    { actualPrice: 700, discountPrice: 500, duration: '30 Days' }
                                ]
                            },
                            numberOfSeats: {
                                type: [
                                    {
                                        student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
                                        gender: { type: String, default: 'boy', required: true },
                                        isBooked: { type: Boolean, default: false }
                                    }
                                ],
                                default: Array(2).fill({
                                    student: null,
                                    gender: 'boy',
                                    isBooked: false
                                })
                            }
                        }
                    ],
                    default: [
                        {
                            stTime: 7,
                            endTime: 12,
                            description: '',
                            price: [
                                { actualPrice: 700, discountPrice: 500, duration: '30 Days' }
                            ],
                            numberOfSeats: Array(2).fill({
                                student: null,
                                gender: 'boy',
                                isBooked: false
                            })
                        },
                        {
                            stTime: 12,
                            endTime: 17,
                            description: '',
                            price: [
                                { actualPrice: 1000, discountPrice: 800, duration: '30 Days' }
                            ],
                            numberOfSeats: Array(2).fill({
                                student: null,
                                gender: 'boy',
                                isBooked: false
                            })
                        },
                        {
                            stTime: 17,
                            endTime: 21,
                            description: '',
                            price: [
                                { actualPrice: 800, discountPrice: 650, duration: '30 Days' }
                            ],
                            numberOfSeats: Array(2).fill({
                                student: null,
                                gender: 'boy',
                                isBooked: false
                            })
                        }
                    ]
                }
            }
        ],
        default: [
            {
                shifts: [
                    {
                        stTime: 7,
                        endTime: 12,
                        description: '',
                        price: [
                            { actualPrice: 700, discountPrice: 500, duration: '30 Days' }
                        ],
                        numberOfSeats: Array(2).fill({
                            student: null,
                            gender: 'boy',
                            isBooked: false
                        })
                    },
                    {
                        stTime: 12,
                        endTime: 17,
                        description: '',
                        price: [
                            { actualPrice: 1000, discountPrice: 800, duration: '30 Days' },
                            { actualPrice: 2000, discountPrice: 1500, duration: '60 Days' }
                        ],
                        numberOfSeats: Array(2).fill({
                            student: null,
                            gender: 'boy',
                            isBooked: false
                        })
                    },
                    {
                        stTime: 17,
                        endTime: 21,
                        description: '',
                        price: [
                            { actualPrice: 800, discountPrice: 650, duration: '30 Days' }
                        ],
                        numberOfSeats: Array(2).fill({
                            student: null,
                            gender: 'boy',
                            isBooked: false
                        })
                    }
                ]
            }
        ]
    },
    isallowed: {
        type: Boolean,
        default: false
    }
});

const Libowner = mongoose.model('Libowner', LibownerSchema);
Libowner.createIndexes();

export default Libowner;